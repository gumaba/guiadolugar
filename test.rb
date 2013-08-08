$:.unshift('.')

require 'lib/hash'
require 'terminfo'
require 'awesome_print'


def print_chart(numbers, chart)
end

def p(obj)
  AwesomePrint.defaults = {
      :indent => -2,
      :color => {
          :hash => :pale,
          :class => :white
      }
  }
  ap obj
end

def run
  def sort_numbers
    numbers = [*1..80]
    sorted_numbers = []
    40.times do |i|
      sorted_numbers.push(numbers.delete_at(rand(numbers.length)))
    end
    return {
        :numbers => numbers,
        :sorted => sorted_numbers[0..29],
        :extra => sorted_numbers[30..39]
    }
  end


  numbers = sort_numbers()

  @configuration = {
      :template => [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0]
      ],
      :sets => {
          :bingo => {
              :name => 'Bingo!',
              :alias => 'bingo',
              :card_match => [
                  [1, 1, 1, 1, 1],
                  [1, 1, 1, 1, 1],
                  [1, 1, 1, 1, 1]
              ],
              :rate => 10
          },
          :line1 => {
              :name => 'Line!',
              :alias => 'line',
              :card_match => [
                  [1, 1, 1, 1, 1],
                  [0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0],
              ],
              :rate => 1
          },
          :line2 => {
              :name => 'Line!',
              :alias => 'line',
              :card_match => [
                  [0, 0, 0, 0, 0],
                  [1, 1, 1, 1, 1],
                  [0, 0, 0, 0, 0]
              ],
              :rate => 1
          },
          :line3 => {
              :name => 'Line!',
              :alias => 'line',
              :card_match => [
                  [0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0],
                  [1, 1, 1, 1, 1],
              ],
              :rate => 1
          },
          :fuck => {
              :name => 'Fuck!',
              :alias => 'fuck',
              :card_match => [
                  [1, 1, 1, 1, 1],
                  [1, 0, 1, 0, 1],
                  [1, 1, 1, 1, 1],
              ],
              :rate => 10
          },

      }
  }

  def get_matched_sets(chart)
    available_set = {}
    @configuration[:sets].each do |k, v|
      match_set = v[:card_match]
      matched = true
      catch(:dontmatch) do
        match_set.each_with_index do |cols, line|
          cols.each_with_index do |item, col|
            if item != 0 then
              if chart[line][col] == 0
                matched = false
                throw :dontmatch
              end
            end
          end
        end
      end
      if matched
        available_set[k] = v[:alias]
      end
    end
    return available_set
  end

  earned_aliases = {}

  @configuration[:sets].each do |k, v|
    r = rand(v[:rate])
    if r == 0 and not earned_aliases.values.include?(v[:alias])
      earned_aliases[k] = v[:alias]
    end
  end

  chart = @configuration[:template]

  earned_aliases.each do |id, al|
    earned_set = @configuration[:sets][id][:card_match]
    earned_set.each_with_index do |cols, line|
      cols.each_with_index do |item, col|
        if chart[line][col] == 0 then
          chart[line][col] = item
        end
      end
    end
  end

  available_set = get_matched_sets(chart)

  chart.each_with_index do |cols, line|
    cols.each_with_index do |item, col|
      if item == 0 then
        chart[line][col] = 2
      end
    end
  end

  p({'available' => available_set})
  p({'earned' => earned_aliases})
  p({'chart' => chart})
  puts '======================'
end

run()
run()
run()
run()